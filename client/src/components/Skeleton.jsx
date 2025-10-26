import React from 'react';

const Skeleton = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4',
  rounded = 'rounded',
  ...props 
}) => {
  return (
    <div 
      className={`skeleton ${width} ${height} ${rounded} ${className}`}
      {...props}
    />
  );
};

// Predefined skeleton components
export const SkeletonCard = () => (
  <div className="card p-6 space-y-4">
    <Skeleton height="h-6" width="w-3/4" />
    <Skeleton height="h-4" />
    <Skeleton height="h-4" width="w-1/2" />
    <div className="flex justify-between items-center">
      <Skeleton height="h-8" width="w-20" />
      <Skeleton height="h-8" width="w-16" />
    </div>
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="card p-4 flex items-center space-x-4">
        <Skeleton height="h-6" width="w-6" rounded="rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton height="h-4" width="w-3/4" />
          <Skeleton height="h-3" width="w-1/2" />
        </div>
        <Skeleton height="h-8" width="w-16" />
      </div>
    ))}
  </div>
);

export const SkeletonForm = () => (
  <div className="card p-6 space-y-6">
    <div className="space-y-2">
      <Skeleton height="h-4" width="w-20" />
      <Skeleton height="h-10" />
    </div>
    <div className="space-y-2">
      <Skeleton height="h-4" width="w-24" />
      <Skeleton height="h-10" />
    </div>
    <div className="space-y-2">
      <Skeleton height="h-4" width="w-16" />
      <Skeleton height="h-20" />
    </div>
    <Skeleton height="h-10" width="w-24" />
  </div>
);

export default Skeleton;
