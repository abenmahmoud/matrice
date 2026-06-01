import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  className?: string;
}

export function EditableField({ label, value, onSave, multiline, className }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleBlur = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  return (
    <div className="space-y-1">
      {label ? <p className="text-xs font-medium text-matrice-or-fonce uppercase tracking-wider">{label}</p> : null}
      {editing ? (
        multiline ? (
          <Textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleBlur}
            className="min-h-[80px] border-matrice-sable bg-white text-sm text-matrice-encre focus:border-matrice-or-fonce"
          />
        ) : (
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleBlur}
            className="border-matrice-sable bg-white text-sm text-matrice-encre focus:border-matrice-or-fonce"
          />
        )
      ) : (
        <p
          className={cn(
            "text-sm text-matrice-encre/82 leading-relaxed cursor-text rounded-md px-2 py-1.5 hover:bg-matrice-sable/35 transition-colors min-h-[2rem] whitespace-pre-wrap",
            className,
          )}
          onClick={() => { setEditing(true); setDraft(value); }}
          data-testid={`editable-${label.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {value || <span className="text-matrice-encre/45 italic">Cliquez pour modifier...</span>}
        </p>
      )}
    </div>
  );
}
