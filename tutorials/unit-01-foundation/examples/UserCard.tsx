interface UserCardProps {
    name: string;
    email: string;
    role: string;
    isActive: boolean;
}

function UserCard({ name, email, role, isActive }: UserCardProps) {
    return (
        <div style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '16px',
            margin: '16px 0',
            maxWidth: '300px'
        }}>
            <h3>{name}</h3>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Role:</strong> {role}</p>
            <p>
                <strong>Status:</strong>{' '}
                <span style={{ color: isActive ? 'green' : 'red' }}>
                    {isActive ? 'Active' : 'Inactive'}
                </span>
            </p>
        </div>
    );
}

export default UserCard;
