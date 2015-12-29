export default class {
  constructor(name = 'Jack') {
    this.name = name
    this.isLogged = false
  }
  // fake authentication
  authenticate(email, password) {
    if (password == 'foo') {
      return this.isLogged = true
    }
    else
      return 'The password was wrong try with "foo"'
  }
}