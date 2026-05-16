export default function Highlight({ text, highlight }) {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  // Split text on highlight term, include term itself into parts, ignore case
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i}>{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
