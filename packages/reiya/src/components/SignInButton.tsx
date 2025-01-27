function signIn(provider: string) {
  throw new Error("Function not implemented.");
}

type Props = {
  children: React.ReactNode;
} & React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export default function SignInButton({ children, ...props }: Props) {
  return (
    <button onClick={() => signIn("instagram")} {...props}>
      {children}
    </button>
  );
}
