import { motion } from "motion/react";
import { ReactNode } from "react";

type Props = {
  label: string;
  value: "individual" | "company";
  selected: "individual" | "company" | null;
  onSelect: (val: "individual" | "company") => void;
  icon: ReactNode;
  selectedColor: string;
};

const SelectionButton = ({
  label,
  value,
  selected,
  onSelect,
  icon,
  selectedColor,
}: Props) => {
  const isSelected = selected === value;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex flex-col cursor-pointer items-center p-6 border rounded-lg transition-colors duration-200 group
        ${
          isSelected
            ? `border-neutral-700 bg-${selectedColor}-50`
            : `border-input hover:border-gray-400`
        }`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors
          ${
            isSelected
              ? `bg-white`
              : `bg-${selectedColor}-100 group-hover:bg-${selectedColor}-200`
          }`}
      >
        {icon}
      </div>
      <span className="font-medium text-gray-900">{label}</span>
    </motion.button>
  );
};

export default SelectionButton;
