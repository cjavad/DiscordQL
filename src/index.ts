import { Engine, Call } from "./engine";

let call: Call;


const engine = new Engine('discord token');
call = new Call('fetchGuild', ['000000000000000000']);
engine.addStack(call);
call = new Call('fetchChannel', ['000000000000000000']);
engine.addStack(call);
engine.executeStack((cmd, clb) => {
    console.log(clb);
});