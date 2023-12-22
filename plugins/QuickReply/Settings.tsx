import { util } from "replugged";
import { SelectItem } from "replugged/components";
import { cfg, modifierKey } from ".";

interface Option {
  label: string;
  value: modifierKey;
}

export function Settings(): React.ReactElement {
  return (
    <div>
      <SelectItem
        {...util.useSetting(cfg, "modifierKey", "ctrlKey")}
        options={
          [
            { label: "Ctrl", value: "ctrlKey" },
            { label: "Shift", value: "shiftKey" },
            { label: "Alt", value: "altKey" },
          ] as Option[]
        }
        note="Modifier key that must be pressed while an arrow key is pressed">
        Modifier key
      </SelectItem>
    </div>
  );
}
