import useField from "../hooks/useField"

const Login = () => {
  const username = useField()
  const password = useField()

  const handleSubmit = (event) => {
    event.preventDefault()
    // Handle login logic here
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username.value}
        onChange={username.onChange}
      />
      <input
        type="password"
        placeholder="Password"
        value={password.value}
        onChange={password.onChange}
      />
      <button type="submit">Login</button>
    </form>
  )
}

export default Login