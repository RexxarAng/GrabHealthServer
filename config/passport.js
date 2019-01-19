const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Manager = require('../models/manager');
const Doctor = require('../models/doctor');
const Receptionist = require('../models/receptionist');
const Admin = require('../models/admin');
const config = require('../config/database');

module.exports = function(passport){
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
    opts.secretOrKey = config.secret;
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        if(jwt_payload.role == "Manager"){
            currentRole = Manager;
        } else if(jwt_payload.role == "Receptionist") {
            currentRole = Receptionist;
        } else if (jwt_payload.role == "Doctor") {
            currentRole = Doctor;
        } else if (jwt_payload.role == "Admin") {
            currentRole = Admin;
        }
        else {
            return done(null, false);
        }
        currentRole.findById(jwt_payload._id, (err, user) => {
            if(err){
                return done(err, false);
            }
            if(user){
                user.role = jwt_payload.role;
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));
  
}

