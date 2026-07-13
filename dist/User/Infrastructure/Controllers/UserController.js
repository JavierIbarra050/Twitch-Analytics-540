"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const Email_1 = require("../../Domain/ValueObjects/Email");
class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    register = async (req, res) => {
        try {
            let emailVo;
            try {
                emailVo = new Email_1.Email(req.body?.email);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
                return;
            }
            const user = await this.userService.registerNewUser(emailVo.toString());
            res.status(200).json({ api_key: user.getUserApiKey() });
        }
        catch {
            res.status(500).json({ error: 'Internal server error.' });
        }
    };
}
exports.UserController = UserController;
