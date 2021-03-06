// This code is a part of MagicCap which is a MPL-2.0 licensed project.
// Copyright (C) Jake Gealer <jake@gealer.email> 2018.
// Copyright (C) Rhys O'Kane <SunburntRock89@gmail.com> 2018.

import { post } from "chainfetch"
import { ConfigHandler } from "../config"

export default {
    name: "Custom",
    icon: "custom.png",
    config_options: {
        URL: {
            value: "custom_url",
            type: "text",
            required: true,
        },
        "Image Body": {
            value: "custom_image",
            type: "text",
            required: true,
        },
        "Response Key": {
            value: "custom_response",
            type: "text",
            required: false,
        },
        Headers: {
            value: "custom_headers",
            type: "object",
            required: false,
        },
        Body: {
            value: "custom_body",
            type: "object",
            required: false,
        },
    },
    upload: async(config: ConfigHandler, buffer: Buffer, _: string, filename: string) => {
        let res = await post(config.o.custom_url)
            .set(config.o.custom_headers)
            .attach(config.o.custom_body)
            .attach("file", buffer, filename)

        if (!config.o.custom_response) return res.body
        return res.body[config.o.custom_response]
    },
}
