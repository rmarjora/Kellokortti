import { useState } from "react"

const useField = () => {
  const [value, setValue] = useState("")

  const reset = () => setValue("")

  const onChange = event => {
    setValue(event.target.value)
  }

  return { value, setValue, reset, onChange }
}

export default useField