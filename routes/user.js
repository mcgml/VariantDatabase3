'use strict';

module.exports = function(app, auth, request, bcrypt){
    app.post('/api/variantdatabase/user/update/password', auth, function(req, res) {
        bcrypt.hash(req.body.password, null, null, function(error, hash) {
            if (error) throw err;
            request.post(
                {
                    uri:"http://127.0.0.1:7474/awmgs/plugins/variantdatabase/user/update/password",
                    json: { email : req.body.email, password : hash }
                },
                function(error, result)
                {
                    if (error) throw err;
                    if (result.statusCode != 200) {
                        res.status(result.statusCode).send(result.body);
                    } else {
                        res.send(result.body);
                    }
                }
            );

        });
    });
};