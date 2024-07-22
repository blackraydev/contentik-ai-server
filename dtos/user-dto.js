class UserDto {
  constructor(model) {
    this.id = model.id;
    this.email = model.email;
    this.isActivated = model.isActivated;
    this.firstName = model.firstName;
    this.lastName = model.lastName;
    this.avatar = model.avatar;
    this.birthday = model.birthday;
  }
}

module.exports = UserDto;
