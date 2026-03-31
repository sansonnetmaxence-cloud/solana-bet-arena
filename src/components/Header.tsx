interface HeaderProps {
  priceDirection: 'up' | 'down' | 'neutral';
}

const Header = ({ priceDirection }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center glow-primary">
          <span className="font-display text-primary text-xs font-bold">S</span>
        </div>
        <h1 className="font-display text-lg md:text-xl font-bold tracking-wider uppercase">
          <span className="text-primary text-glow-primary">SOL</span>
          <span className="text-muted-foreground">BET</span>
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${priceDirection === 'up' ? 'bg-success animate-pulse-glow' : priceDirection === 'down' ? 'bg-danger animate-pulse-glow' : 'bg-muted-foreground'}`} />
        <span className="font-display text-[10px] text-muted-foreground uppercase tracking-widest">Live Feed</span>
      </div>
    </header>
  );
};

export default Header;
