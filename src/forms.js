export const validate = (entries) => {
  let errors = {}
  Object.keys(entries).forEach(key => {
    if (entries[key].error()) {
      errors = {
        ...errors,
        [key]: entries[key].message
      }
    }
  })
  return {
    errors,
    error: Object.keys(errors).length > 0
  }
}

export const clear = (fields) => Object.keys(fields).forEach((key) => fields[key].set(''))

export const update = (fields, editing, newData) => {
  const availableFields = editing.length > 0 ? Object.keys(fields).filter((key) => editing.indexOf(key) === -1) : Object.keys(fields)
  availableFields.forEach((key) => fields[key].value !== newData.data[key] ? fields[key].set(newData.data[key]) : null)
}

export const regex = {
  username: RegExp(/^[a-zA-Z0-9_]{2,15}$/),
  email: RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/),
  phone: RegExp(/^[0-9_-]{6,15}$/)
}

