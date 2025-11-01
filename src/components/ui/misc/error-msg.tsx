export default function ErrorMsg({ message }: { message: string | undefined }) {
  return (
    <small className="absolute top-full right-0 text-red-600">{message}</small>
  );
}
