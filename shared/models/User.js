export default class {
  constructor(name) {
    this.name = name
    this.isLogged = false
  }
  // fake authentication
  auth(email, password) {
    if (password == 'foo') {
      return this.isLogged = true
    }
    else
      return 'The password was wrong try with "foo"'
  }
}