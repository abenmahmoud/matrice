import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
}

export function EditableField({ label, value, onSave, multiline }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleBlur = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      {editing ? (
        multiline ? (
          <Textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleBlur}
            className="min-h-[80px] bg-background/50 border-primary/40 focus:border-primary text-sm"
          />
        ) : (
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleBlur}
            className="bg-background/50 border-primary/40 focus:border-primary text-sm"
          />
        )
      ) : (
        <p
          className="text-sm text-foreground/80 leading-relaxed cursor-text rounded-md px-2 py-1.5 hover:bg-white/5 transition-colors min-h-[2rem] whitespace-pre-wrap"
          onClick={() => { setEditing(true); setDraft(value); }}
          data-testid={`editable-${label.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {value || <span className="text-muted-foreground/50 italic">Cliquez pour modifier...</span>}
        </p>
      )}
    </div>
  );
}
