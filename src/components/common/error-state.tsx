type Props = {
  title?: string;
  message: string;
};

export function ErrorState({ title = "Da co loi xay ra", message }: Props) {
  return (
    <div className="rounded-md border border-[#f4a6b6] bg-[#fff2f5] p-4 text-sm text-[#8a2d49]">
      <p className="font-semibold">{title}</p>
      <p>{message}</p>
    </div>
  );
}
