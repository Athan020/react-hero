interface WelcomeProps {
    name: string;
    // role: string
}


function Welcome({ name }: WelcomeProps) {
    return (
        <div>
            <h2>Welcome to {name}'s React App</h2>
        </div>
    )
}


export default Welcome;