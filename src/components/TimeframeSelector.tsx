import { cn } from '@/lib/utils';

interface TimeframeSelectorProps {
  selected: number;
  onChange: (t: number) => void;
}

const TimeframeSelector = ({ selected, onChange }: TimeframeSelectorProps) => {
  return (
    <div className="flex gap-2">
      {[1, 2, 5].map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            'px-4 py-2 rounded-md font-display text-xs uppercase tracking-wider border transition-all',
            selected === t
              ? 'bg-primary/20 border-primary text-primary glow-primary'
              : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
          )}
        >
          {t}min
        </button>
      ))}
    </div>
  );
};

export default TimeframeSelector;
