const _012_Psithaca$entrypoint = {
  title: "entrypoint",
  description: "Named entrypoint to a Michelson smart contract",
  oneOf: [
    { title: "default", type: "string", enum: ["default"] },
    { title: "root", type: "string", enum: ["root"] },
    { title: "do", type: "string", enum: ["do"] },
    { title: "set_delegate", type: "string", enum: ["set_delegate"] },
    { title: "remove_delegate", type: "string", enum: ["remove_delegate"] },
    { title: "named", type: "string" },
  ],
} as const;
export default _012_Psithaca$entrypoint;
