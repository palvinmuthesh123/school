const nodemon = require('nodemon');

exports.sendToken = (admin, statusCode, res) => {
  const token = admin.getJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  };
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        privilege: admin.privilege,
        container: admin.container,
        cooker: admin.cooker,
        kitchen: admin.kitchen,
        school: admin.school,
        truck: admin.truck
      },
    });
};
