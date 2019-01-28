const Validator = module.exports;

module.exports.validateEmail = function(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

module.exports.validatePasswords = function(user){
    if (user.password == user.cfmpassword) {
        return true;
    } else {
        return false;
    }
}

module.exports.validateContactNo = function(contactNo){
    var re = /^[689]\d{7}$/ 
    return re.test(contactNo);
}

module.exports.validateNric = function(ic){
    if(ic === null || ic === undefined || ic === '')
        return false;
    var icArray = new Array(9);
    for (let i = 0; i < 9; i++) {
      icArray[i] = ic.charAt(i);
    }
    icArray[1] *= 2;
    icArray[2] *= 7;
    icArray[3] *= 6;
    icArray[4] *= 5;
    icArray[5] *= 4;
    icArray[6] *= 3;
    icArray[7] *= 2;
    var weight = 0;
    for (let i = 1; i < 8; i++) {
      weight += parseInt(icArray[i]);
    }
    var offset = (icArray[0] == "T" || icArray[0] == "G") ? 4 : 0;
    var temp = (offset + weight) % 11;
    var st = Array("J", "Z", "I", "H", "G", "F", "E", "D", "C", "B", "A");
    var fg = Array("X", "W", "U", "T", "R", "Q", "P", "N", "M", "L", "K");
    var theAlpha;
    if (icArray[0] == "S" || icArray[0] == "T") {
      theAlpha = st[temp];
    } else if (icArray[0] == "F" || icArray[0] == "G") {
      theAlpha = fg[temp];
    }
    return (icArray[8] == theAlpha);
  }

  module.exports.validatePasswordStrength = function(password) {
    var hasUpperCase = /[A-Z]/ // at least 1 uppercase
    var hasLowerCase = /[a-z]/ // at least 1 lowercase
    var hasNumbers = /[0-9]/ // at least 1 digit number
    if (password.length < 8) {
        return false;
    }
    else if (password.length >= 8) {
        if (password.search(hasUpperCase) == -1) {
        return false;
        }
        else if (password.search(hasNumbers) == -1) {
        return false;
        }
        else if (password.search(hasLowerCase) == -1) {
        return false;
        }
        else if (password.search(hasLowerCase) >= 0 && password.search(hasUpperCase) >= 0 && password.search(hasNumbers) >= 0) {
        return true;
        }
    }
    

}


//Validation for patient fields
/* Validation for first name */
module.exports.validateFirstName = function(firstName) {
    if (firstName.length === '' || firstName.length === 0) {
        return false;
    } else {
        return true;
    }
}

/* Validation for last name */
module.exports.validateLastName = function(lastName) {
    if (lastName.length === '' || lastName.length === 0) {
        return false;
    } else {
        return true;
    }
} 

/* Validation for gender */
module.exports.validateGender = function(gender) {
    if (gender.length === '' || gender.length === 0 || gender.select === '') {
        return false;
    } else {
        return true;
    }
}

/* Validation for address */
module.exports.validateAddress = function(address) {
    if (address.length === '' || address.length === 0 || address.length >256) {
        return false;
    } else {
        return true;
    }
}

/* Validation for dob */
module.exports.validateDOB = function(dob) {
    var re = /^(19|20)\d\d[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])$/;
    return re.test(dob);
}

/* Validation for nationality */
module.exports.validateNationality = function(nationality) {
    if (nationality.length === '' || nationality.length === 0 || nationality.select === '') {
        return false;
    } else {
        return true;
    }
}

/* Validation for contact no. */
module.exports.validateContactNo = function(contactNo) {
    var re = /^[689]\d{7}$/;
    return re.test(contactNo);
}