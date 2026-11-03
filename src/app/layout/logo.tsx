export default function Logo({ className = 'size-8' }: { className?: string }) {
  return <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className={`shrink-0 ${className}`} />;
}
