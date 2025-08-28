import useField from "../hooks/useField"

const SupervisorLogin = ({ onLogin, onLogout }) => {
  const username = useField()
  const password = useField()

  const handleSubmit = async (event) => {
    event.preventDefault()
    const isValid = await window.api.comparePassword(username.value, password.value)
    if (isValid) {
      onLogin(username.value)
    } else {
      alert("Invalid credentials")
    }
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

export default SupervisorLogin