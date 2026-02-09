
import './App.css'
import TodoList from './TodoList'
import UserCard from './UserCard'

function App() {

  return (
    <>
      {/* <div>
        <Greeting name='Athandile' timeOfDay='afternoon' />
      </div>
      <div className="card">
        <p>
          I guess I'm learning react to sort future prrof my skills. React is continously taking over industry and a rapid pace With its ever growing community of innovation theres just no other option but to learn it.
        </p>
      </div> */}
      <UserCard name='Athandile' email='athandiletembile@gmail.com' role='Admin' isActive={false} />
      <TodoList todos={['Learn React', 'Learn TypeScript', 'Learn Node.js']} />
    </>
  )
}

export default App
