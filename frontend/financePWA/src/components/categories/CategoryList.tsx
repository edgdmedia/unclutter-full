import React from 'react';
import { Category } from '@/services/categoriesApi';

interface CategoryListProps {
  categories: Category[];
  onCategoryClick: (category: Category) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  isLoading?: boolean;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onCategoryClick,
  onEditCategory,
  onDeleteCategory,
  isLoading = false,
}) => {
  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }
  if (!categories.length) {
    return <div className="p-4 text-center text-muted-foreground">No categories found.</div>;
  }
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-12 font-medium py-2 px-3 text-sm border-b">
        <div className="col-span-5">Name</div>
        <div className="col-span-5">Description</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>
      {categories.map(category => (
        <div
          key={category.id}
          className="grid grid-cols-12 items-center py-2 px-3 hover:bg-muted rounded cursor-pointer group"
          onClick={() => onCategoryClick(category)}
        >
          <div className="col-span-5 font-medium">{category.name}</div>
          <div className="col-span-5 text-muted-foreground truncate">{category.description || '-'}</div>
          <div className="col-span-2 flex justify-end space-x-1" onClick={e => e.stopPropagation()}>
            {!category.isGlobal ? (
              <>
                <button
                  className="p-1 rounded hover:bg-muted"
                  title="Edit Category"
                  onClick={() => onEditCategory(category)}
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm0 0v3m0 0H6m3 0h3" /></svg>
                </button>
                <button
                  className="p-1 rounded hover:bg-muted"
                  title="Delete Category"
                  onClick={() => onDeleteCategory(category)}
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22" /></svg>
                </button>
              </>
            ) : (
              <span className="text-center w-full text-muted-foreground">-</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryList;
