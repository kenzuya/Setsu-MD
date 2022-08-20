import chalk from "chalk";
import moment from "moment-timezone";
import { color } from "./Modules";
import { MessageSerializer } from "./Serialize";
const tell = (text: string, color?: string) => {
    console.log(chalk.red("[ ! ]"), chalk.cyan.bold(moment().locale("id").tz("Asia/Jakarta").format("L LTS"))),
        color ? (color.startsWith("#") ? chalk.hex(color)(text) : chalk.yellow(text)) : chalk.yellowBright(text);
};

const warn = (text: string, color: string) => {
    console.log(chalk.redBright.bold("[SYS]"), chalk.cyan.bold(moment().locale("id").tz("Asia/Jakarta").format("L LTS")), color.startsWith("#") ? chalk.hex(color)(text) : "");
};

const changes = (text: string) => {
    console.log(chalk.redBright.bold("[ ! ]"), chalk.cyan.bold(moment().locale("id").tz("Asia/Jakarta").format("L LTS")), chalk.hex("#6edb00")(text));
};
const command = async (m: MessageSerializer) => {
    if (m.isCmd) {
        console.log(
            color("[CMD]", "#8a24e3"),
            chalk.cyan(`${moment().locale("id").tz("Asia/Jakarta").format("L LTS")}`),
            chalk.yellow(m.pushname),
            color(`menggunakan fitur`, "#e1eb28"),
            color(m.command!, "#28ebb0"),
            color("\n ->  ", "#eb6c28"),
            color("Dari", "#c227bf"),
            color(`${m.sender}`, "#ebe728"),
            m.isGroup ? color("\n ->  ", "#eb6c28") : "",
            m.isGroup ? chalk.green(`Di Group ${m.group?.name}`) : "",
            m.isGroup ? chalk.blueBright(m.chat) : ""
        );
    }
};
const messages = (m: MessageSerializer) => {
    console.log(
        color("[MSG]", "#03fc17"),
        chalk.cyan(`${moment().locale("id").tz("Asia/Jakarta").format("L LTS")}`),
        chalk.black(chalk.bgMagenta(m.body || m.mtype)) + "\n" + chalk.magenta(" =>   Dari"),
        chalk.greenBright(m.pushname, m.sender),
        m.isGroup ? chalk.blueBright("\n=> Di Group") : "",
        m.isGroup ? chalk.green(m.group?.name, m.chat) : ""
    );
};
const Logger = { tell, warn, changes, command, messages };
export default Logger;
