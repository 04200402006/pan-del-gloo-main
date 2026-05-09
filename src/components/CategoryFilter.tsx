import { cn } from "@/lib/utils";
import { CategoryDB } from "@/hooks/useProducts";

interface CategoryFilterProps {
  categories: CategoryDB[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const all = [{ id: "all", name: "Todos", slug: "all" }, ...categories];

  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-3 py-6">
      {all.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.slug)}
          aria-pressed={selectedCategory === category.slug}
          className={cn(
            "px-4 md:px-6 py-2 md:py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-300",
            "border-2",
            selectedCategory === category.slug
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-transparent text-foreground border-border hover:border-primary hover:text-primary"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
