function signOut(provider: string) {
  throw new Error("Function not implemented.");
}

type Props = {
  children: React.ReactNode;
} & React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export default function SignOutButton({ children }: Props) {
  return <button onClick={() => signOut()}>{children}</button>;
}
