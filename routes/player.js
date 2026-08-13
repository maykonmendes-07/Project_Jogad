const fs = require('fs');
const path = require('path');

module.exports = {
    addPlayerPage: (req, res) => {
        res.render('add-player.ejs', { title: "Welcome to Socka | Add a new player", message: '' });
    },

    addPlayer: (req, res) => {
        if (!req.files) {
            return res.status(400).send("No files were uploaded.");
        }

        let message = '';
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let position = req.body.position;
        let number = req.body.number;
        let username = req.body.username;
        let uploadedFile = req.files.image;
        let fileExtension = uploadedFile.mimetype.split('/')[1];
        let image_name = username + '.' + fileExtension;

        let usernameQuery = "SELECT * FROM `players` WHERE user_name = '" + username + "'";

        db.query(usernameQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (result.length > 0) {
                message = 'Username already exists';
                return res.render('add-player.ejs', { message, title: "Welcome to Socka | Add a new player" });
            } else {
                if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') {

                    // Caminho absoluto correto
                    let uploadDir = path.join(process.cwd(), 'public', 'assets', 'img');
                    let uploadPath = path.join(uploadDir, image_name);


                    // Força o Node.js a criar as pastas se elas não existirem no Windows
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }

                    // Move o arquivo após garantir que a pasta existe
                    uploadedFile.mv(uploadPath, (err) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        let query = "INSERT INTO `players` (first_name, last_name, position, number, image, user_name) VALUES ('" + first_name + "', '" + last_name + "', '" + position + "', '" + number + "', '" + image_name + "', '" + username + "')";
                        db.query(query, (err, result) => {
                            if (err) {
                                return res.status(500).send(err);
                            }
                            return res.redirect('/');
                        });
                    });

                } else {
                    message = "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
                    return res.render('add-player.ejs', { message, title: "Welcome to Socka | Add a new player" });
                }
            }
        });
    },

    editPlayerPage: (req, res) => {
        let playerId = req.params.id;
        let query = "SELECT * FROM `players` WHERE id = '" + playerId + "' ";
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            return res.render('edit-player.ejs', { title: "Edit Player", player: result[0], message: '' });
        });
    },

    editPlayer: (req, res) => {
        let playerId = req.params.id;
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let position = req.body.position;
        let number = req.body.number;
        let query = "UPDATE `players` SET `first_name` = '" + first_name + "', `last_name` = '" + last_name + "', `position` = '" + position + "', `number` = '" + number + "' WHERE `players`.`id` = '" + playerId + "'";
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            return res.redirect('/');
        });
    },

    deletePlayer: (req, res) => {
        let playerId = req.params.id;
        let getImageQuery = 'SELECT image from `players` WHERE id = "' + playerId + '"';
        let deleteUserQuery = 'DELETE FROM players WHERE id = "' + playerId + '"';

        db.query(getImageQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (result.length === 0) {
                return res.status(404).send("Player not found");
            }

            let image = result[0].image;
            let deletePath = path.join(process.cwd(), 'public', 'assets', 'img', image);

            fs.unlink(deletePath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    return res.status(500).send(err);
                }
                db.query(deleteUserQuery, (err, result) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    return res.redirect('/');
                });
            });
        });
    }
};
