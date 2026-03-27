type Props = {
  title?: string;
  message: string;
};

export function ErrorState({ title = "Something went wrong", message }: Props) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <p className="font-semibold">{title}</p>
      <p>{message}</p>
    </div>
  );
}
