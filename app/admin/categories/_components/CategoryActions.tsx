"use client";

import { EditCategoryButton } from "./EditCategoryButton";
import { DeleteCategoryButton } from "./DeleteCategoryButton";

export function CategoryActions({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  return (
    <div
      className="flex gap-3"
      onClick={(e) => e.stopPropagation()}
    >
      <EditCategoryButton
        id={id}
        currentName={name}
      />

      <DeleteCategoryButton
        id={id}
        name={name}
      />
    </div>
  );
}