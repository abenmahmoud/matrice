#!/usr/bin/env python3
"""Phase 2A acceptance tests for the Matrice VPS deployment.

Run from /opt/matrice on the VPS. The script temporarily switches the API to
commercial mode, runs end-to-end API checks, cleans up test data, and restores
the original .env + API container before exiting.
"""

from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


BASE_URL = "https://matrice.essuf.fr"
ROOT = Path("/opt/matrice")
ENV_PATH = ROOT / ".env"


class AcceptanceFailure(RuntimeError):
    pass


def run(command: list[str], *, cwd: Path = ROOT) -> str:
    return subprocess.check_output(command, cwd=cwd, text=True).strip()


def compose_recreate_api() -> None:
    subprocess.check_call(
        ["docker", "compose", "up", "-d", "--force-recreate", "api"],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
    )
    time.sleep(8)


def read_env() -> dict[str, str]:
    values: dict[str, str] = {}
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key] = value
    return values


def update_env(updates: dict[str, str]) -> None:
    lines = ENV_PATH.read_text(encoding="utf-8").splitlines()
    seen: set[str] = set()
    output: list[str] = []

    for line in lines:
        if "=" in line and not line.lstrip().startswith("#"):
            key = line.split("=", 1)[0]
            if key in updates:
                output.append(f"{key}={updates[key]}")
                seen.add(key)
                continue
        output.append(line)

    for key, value in updates.items():
        if key not in seen:
            output.append(f"{key}={value}")

    ENV_PATH.write_text("\n".join(output) + "\n", encoding="utf-8")


def parse_body(raw: str) -> Any:
    try:
        return json.loads(raw) if raw else None
    except json.JSONDecodeError:
        return raw


def request(
    method: str,
    path: str,
    data: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
    timeout: int = 75,
) -> tuple[int, Any, str]:
    body = None if data is None else json.dumps(data).encode("utf-8")
    req_headers = {"Accept": "application/json"}
    if data is not None:
        req_headers["Content-Type"] = "application/json"
    if headers:
        req_headers.update(headers)

    req = urllib.request.Request(BASE_URL + path, data=body, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            raw = response.read().decode("utf-8", errors="replace")
            return response.status, parse_body(raw), raw
    except urllib.error.HTTPError as err:
        raw = err.read().decode("utf-8", errors="replace")
        return err.code, parse_body(raw), raw


def sql(query: str) -> str:
    return run(
        [
            "docker",
            "compose",
            "exec",
            "-T",
            "postgres",
            "psql",
            "-U",
            "matrice",
            "-d",
            "matrice_narrative",
            "-At",
            "-c",
            query,
        ]
    )


def sql_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


class Results:
    def __init__(self) -> None:
        self.items: list[tuple[str, str, str]] = []

    def check(self, name: str, condition: bool, detail: str = "") -> None:
        status = "PASS" if condition else "FAIL"
        self.items.append((status, name, detail))
        if not condition:
            raise AcceptanceFailure(f"{name}: {detail}")

    def print(self) -> None:
        print("=== PHASE 2A ACCEPTANCE RESULTS ===")
        for status, name, detail in self.items:
            print(f"{status} {name} {detail}")
        passed = sum(1 for status, _, _ in self.items if status == "PASS")
        failed = sum(1 for status, _, _ in self.items if status == "FAIL")
        print(f"SUMMARY pass={passed} fail={failed}")


def run_tests() -> Results:
    stamp = str(int(time.time()))
    email = f"phase2a_accept_{stamp}@example.test"
    password = "Phase2A!pass123"
    new_password = "Phase2A!new456"
    module_slug = f"phase-2a-accept-{stamp}"
    user_id: str | None = None
    results = Results()

    try:
        code, body, _ = request("GET", "/api/healthz")
        results.check("01 healthz OK", code == 200 and body.get("status") == "ok", f"{code} {body}")

        pages = [
            "/",
            "/pricing",
            "/signup",
            "/onboarding",
            "/forgot-password",
            "/reset-password",
            "/verify-email",
            "/experimental-modules",
        ]
        bad_pages = []
        for page in pages:
            code, _, _ = request("GET", page, timeout=25)
            if code != 200:
                bad_pages.append((page, code))
        results.check("02 public pages load", not bad_pages, str(bad_pages))

        code, body, _ = request("GET", "/api/access")
        results.check(
            "03 commercial public access",
            code == 200 and body.get("mode") == "commercial" and body.get("viewer", {}).get("role") == "public",
            f"{code} {body}",
        )

        code, body, _ = request("GET", "/api/projects")
        results.check(
            "04 anonymous projects blocked",
            code == 401 and body.get("error") == "AUTH_REQUIRED",
            f"{code} {body}",
        )

        code, body, _ = request("POST", "/api/auth/signup", {"email": email, "password": "short", "displayName": "Bad"})
        results.check(
            "05 invalid signup rejected",
            code == 400 and body.get("error") == "EMAIL_AND_PASSWORD_REQUIRED",
            f"{code} {body}",
        )

        code, body, _ = request(
            "POST",
            "/api/auth/signup",
            {"email": email, "password": password, "displayName": "Phase 2A Accept"},
        )
        results.check(
            "06 signup creates unverified user",
            code == 201
            and body.get("emailVerificationRequired") is True
            and body.get("user", {}).get("isEmailVerified") is False,
            f"{code} {body}",
        )
        user_id = body["user"]["id"]

        code, body, _ = request("POST", "/api/auth/login", {"email": email, "password": password})
        results.check(
            "07 login blocked before email verification",
            code == 403 and body.get("error") == "EMAIL_NOT_VERIFIED",
            f"{code} {body}",
        )

        verification_token = sql(
            f"select email_verification_token from app_users where email={sql_quote(email)};"
        )
        results.check(
            "08 verification token stored",
            bool(verification_token),
            "present" if verification_token else "missing token",
        )
        code, body, _ = request(
            "GET", "/api/auth/verify-email?token=" + urllib.parse.quote(verification_token)
        )
        user_token = body.get("token") if isinstance(body, dict) else None
        results.check(
            "09 verify email returns user token",
            code == 200 and body.get("user", {}).get("isEmailVerified") is True and bool(user_token),
            f"{code} {body}",
        )
        auth = {"Authorization": f"Bearer {user_token}"}

        code, body, _ = request("GET", "/api/auth/me", headers=auth)
        results.check(
            "10 bearer auth /me works",
            code == 200 and body.get("user", {}).get("email") == email,
            f"{code} {body}",
        )

        code, body, _ = request("POST", "/api/auth/onboarding/complete", {}, headers=auth)
        results.check(
            "11 onboarding complete works",
            code == 200 and bool(body.get("user", {}).get("onboardingCompletedAt")),
            f"{code} {body}",
        )

        code, body, _ = request("POST", "/api/auth/forgot-password", {"email": "nobody-phase2a@example.test"})
        results.check(
            "12 forgot password anti-enumeration",
            code == 200 and body.get("ok") is True,
            f"{code} {body}",
        )
        code, body, _ = request("POST", "/api/auth/forgot-password", {"email": email})
        results.check(
            "13 forgot password existing user",
            code == 200 and body.get("ok") is True,
            f"{code} {body}",
        )
        reset_token = sql(f"select password_reset_token from app_users where email={sql_quote(email)};")
        results.check("14 reset token stored", bool(reset_token), "present" if reset_token else "missing reset token")
        code, body, _ = request("POST", "/api/auth/reset-password", {"token": reset_token, "password": new_password})
        results.check(
            "15 reset password works",
            code == 200 and body.get("user", {}).get("email") == email,
            f"{code} {body}",
        )
        code, body, _ = request("POST", "/api/auth/login", {"email": email, "password": new_password})
        user_token = body.get("token") if isinstance(body, dict) else None
        results.check("16 login works after reset", code == 200 and bool(user_token), f"{code} {body}")
        auth = {"Authorization": f"Bearer {user_token}"}

        code, body, _ = request("POST", "/api/projects", {"title": "Incomplete"}, headers=auth)
        results.check(
            "17 invalid project gives 400 not 500",
            code == 400 and body.get("error") == "INVALID_PROJECT_INPUT",
            f"{code} {body}",
        )

        valid_project = {
            "title": "Phase 2A Acceptance",
            "rawIdea": "Une romanciere teste une plateforme narrative avant son lancement commercial.",
            "inputType": "raw",
            "genre": "drame",
            "tone": "tendu et lumineux",
            "targetFormat": "Roman",
            "temporalLogic": "lineaire",
            "realityLevel": "realiste",
            "targetAudience": "adultes",
            "artisticAmbition": "professionnelle",
            "visualMoods": ["sobre"],
            "cinematicReferences": "",
            "inspirationSources": "",
            "manuscriptExcerpt": "",
        }
        code, body, _ = request("POST", "/api/projects", valid_project, headers=auth)
        project_id = body.get("id") if isinstance(body, dict) else None
        results.check("18 first free project created", code == 201 and bool(project_id), f"{code} {body}")
        code, body, _ = request("POST", "/api/projects", {**valid_project, "title": "Phase 2A Acceptance 2"}, headers=auth)
        results.check(
            "19 second free project paywalled",
            code == 402 and body.get("error") == "FREE_PROJECT_LIMIT_REACHED",
            f"{code} {body}",
        )

        admin_password = read_env().get("ADMIN_PASSWORD")
        results.check(
            "20 admin password configured",
            bool(admin_password),
            "present" if admin_password else "ADMIN_PASSWORD missing",
        )
        code, body, _ = request("POST", "/api/admin/login", {"password": admin_password})
        admin_token = body.get("token") if isinstance(body, dict) else None
        results.check("21 admin login works", code == 200 and bool(admin_token), f"{code} {body}")
        admin = {"x-admin-token": admin_token}

        code, body, _ = request(
            "POST",
            "/api/experimental-modules",
            {
                "slug": module_slug,
                "name": "Phase 2A Studio Lab",
                "description": "Module de test acceptance Phase 2A",
                "minimumPlan": "studio",
                "isOwnerOnly": False,
                "isEnabled": True,
            },
            headers=admin,
        )
        module_id = body.get("module", {}).get("id") if isinstance(body, dict) else None
        results.check("22 owner can create experimental module", code == 201 and bool(module_id), f"{code} {body}")

        code, body, _ = request("GET", "/api/experimental-modules", headers=auth)
        module = next((m for m in body.get("modules", []) if m.get("slug") == module_slug), None)
        results.check(
            "23 free user sees studio module unavailable",
            code == 200 and module and module.get("available") is False,
            f"{code} {body}",
        )

        code, body, _ = request(
            "PATCH",
            f"/api/admin/subscriptions/users/{user_id}",
            {"plan": "studio", "resetUsage": True},
            headers=admin,
        )
        results.check("24 admin upgrades user to studio", code == 200 and body.get("plan") == "studio", f"{code} {body}")

        code, body, _ = request("GET", "/api/access", headers=auth)
        results.check(
            "25 upgraded user is paid studio",
            code == 200 and body.get("plan") == "studio" and body.get("isPaid") is True,
            f"{code} {body}",
        )

        code, body, _ = request("GET", "/api/experimental-modules", headers=auth)
        module = next((m for m in body.get("modules", []) if m.get("slug") == module_slug), None)
        results.check(
            "26 studio user can access studio module",
            code == 200 and module and module.get("available") is True,
            f"{code} {body}",
        )

    finally:
        if user_id:
            sql(f"delete from projects where owner_user_id={sql_quote(user_id)};")
        sql(f"delete from app_users where email={sql_quote(email)};")
        sql(f"delete from experimental_modules where slug={sql_quote(module_slug)};")

    return results


def main() -> None:
    if not ENV_PATH.exists():
        raise SystemExit("/opt/matrice/.env is missing")

    fd, backup_name = tempfile.mkstemp(prefix="matrice-env-phase2a-", dir="/tmp")
    Path(backup_name).unlink(missing_ok=True)
    backup = Path(backup_name)
    shutil.copy2(ENV_PATH, backup)

    try:
        update_env(
            {
                "MATRICE_PRODUCT_MODE": "commercial",
                "MATRICE_DEFAULT_PLAN": "free",
                "MATRICE_FREE_PROJECT_LIMIT": "1",
                "MATRICE_FREE_GENERATION_LIMIT": "2",
                "MATRICE_PUBLIC_BASE_URL": BASE_URL,
            }
        )
        compose_recreate_api()
        results = run_tests()
        results.print()
    finally:
        shutil.copy2(backup, ENV_PATH)
        compose_recreate_api()
        backup.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
