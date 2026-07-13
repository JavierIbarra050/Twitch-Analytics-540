"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTokenController = void 0;
const Email_1 = require("../../Domain/ValueObjects/Email");
class UserTokenController {
    userTokenService;
    constructor(userTokenService) {
        this.userTokenService = userTokenService;
    }
    generateToken = async (req, res) => {
        try {
            const api_key = req.body?.api_key;
            let emailVo;
            try {
                emailVo = new Email_1.Email(req.body?.email);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
                return;
            }
            if (!api_key) {
                res.status(400).json({ error: 'The api_key is mandatory' });
                return;
            }
            const token = await this.userTokenService.generateToken(emailVo.toString(), api_key);
            res.status(200).json({ token });
        }
        catch (error) {
            if (error.message && error.message.includes('Unauthorized')) {
                res.status(401).json({ error: 'Unauthorized. API access token is invalid.' });
                return;
            }
            res.status(500).json({ error: 'Internal server error.' });
        }
    };
}
exports.UserTokenController = UserTokenController;
