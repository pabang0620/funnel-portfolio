import { cn } from '../../lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeClasses = {
  sm: {
    image: 'w-16 h-16',
    spinner: 'w-4 h-4 border-2',
    text: 'text-sm',
    gap: 'gap-3',
  },
  md: {
    image: 'w-24 h-24',
    spinner: 'w-6 h-6 border-3',
    text: 'text-base',
    gap: 'gap-4',
  },
  lg: {
    image: 'w-32 h-32',
    spinner: 'w-8 h-8 border-4',
    text: 'text-lg',
    gap: 'gap-5',
  },
};

export function Loading({ className, size = 'md', text = '로딩 중...' }: LoadingProps) {
  const sizes = sizeClasses[size];

  return (
    <div className={cn('flex flex-col items-center justify-center p-8', sizes.gap, className)}>
      {/* 로딩 이미지 */}
      <img
        src="/images/loading.png"
        alt="로딩 중"
        className={cn('object-contain', sizes.image)}
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />

      {/* 스피너 */}
      <div
        className={cn(
          'border-gray-200 border-t-primary rounded-full animate-spin',
          sizes.spinner
        )}
      />

      {/* 텍스트 */}
      {text && (
        <p className={cn('text-muted-foreground', sizes.text)}>{text}</p>
      )}
    </div>
  );
}
