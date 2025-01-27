function signIn(provider: string) {
  throw new Error("Function not implemented.");
}

type Props = {
  children: React.ReactNode;
} & React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>;

export default function SignInButton({ children, ...props }: Props) {
  return (
    <a href="/flows/google" {...props}>
      {children}
    </a>
  );
}
