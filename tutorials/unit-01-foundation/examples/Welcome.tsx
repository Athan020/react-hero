interface WelcomeProps {
  name: string;
  role: string;
}

function Welcome({ name, role }: WelcomeProps) {
  return (
    <div>
      <h2>Welcome, {name}!</h2>
      <p>Your role: {role}</p>
    </div>
  );
}

export default Welcome;
