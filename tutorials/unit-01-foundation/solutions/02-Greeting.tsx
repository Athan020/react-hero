interface GreetingProps {
    name: string;
    timeOfDay: "morning" | "afternoon" | "evening";
}

function Greeting({ name, timeOfDay }: GreetingProps) {
    return (
        <h2>Good {timeOfDay}, {name}!</h2>
    );
}

export default Greeting;
