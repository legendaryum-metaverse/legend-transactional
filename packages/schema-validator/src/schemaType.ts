import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
import {
    availableMicroservices,
    AvailableMicroservices,
    CommandMap,
    imageCommands,
    MicroserviceCommand,
    mintCommands
} from 'legend-transac';
const ajv = new Ajv();

const commandMapSchemaMint: JTDSchemaType<CommandMap['mint']> = {
    enum: [mintCommands.MintImage]
};

const commandMapSchemaImage: JTDSchemaType<CommandMap['image']> = {
    enum: [imageCommands.CreateImage, imageCommands.UpdateToken]
};

const microserviceCommandSchemaWithDiscriminator: JTDSchemaType<MicroserviceCommand<AvailableMicroservices>> = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - porque no reconoce el discriminator, habría que agregarlo a la librería pero no es solución.
    discriminator: 'microservice',
    mapping: {
        [availableMicroservices.Mint]: {
            properties: {
                command: commandMapSchemaMint
            }
        },
        [availableMicroservices.Image]: {
            properties: {
                command: commandMapSchemaImage
            }
        }
    }
};

// Esta opción funciona, pero no discrimina los comandos por Micro.
/*
const availableMicroservicesSchema: JTDSchemaType<AvailableMicroservices> = {
    enum: [AvailableMicroservices.Image, AvailableMicroservices.Mint]
};
const availableCommands: JTDSchemaType<CommandMap[AvailableMicroservices]> = {
    enum: [ImageCommands.CreateImage, ImageCommands.UpdateToken, MintCommands.MintImage]
};
const microserviceCommandSchema: JTDSchemaType<MicroserviceCommand<AvailableMicroservices>> = {
    properties: {
        command: availableCommands,
        microservice: availableMicroservicesSchema
    }
};*/

const microserviceCommandSchemaArray: JTDSchemaType<MicroserviceCommand<AvailableMicroservices>[]> = {
    elements: microserviceCommandSchemaWithDiscriminator
};
/**
 * Parser to validate the json array of microservice commands.
 * @param microserviceCommandArrayParser
 * @returns {MicroserviceCommand<AvailableMicroservices>[]} - Array of microservice commands.
 * @example
 * const cmds = microserviceCommandArrayParser(jsonString);
 * if (cmds === undefined) {
 *     throw new Error(
 *         `${file} ${microserviceCommandArrayParser.message ?? ''}
 *          ${microserviceCommandArrayParser.position ?? ''}`);
 * }
 *  // otherwise, cmds is an array of microservice commands.
 *
 *
 *
 */
export const microserviceCommandArrayParser = ajv.compileParser(microserviceCommandSchemaArray);

// **************   Otro esquemas que puedan ser útiles en el futuro : **************************
// const microserviceCommandMintSchema: JTDSchemaType<MicroserviceCommand<AvailableMicroservices.Mint>> = {
//     properties: {
//         command: commandMapSchemaMint,
//         microservice: {
//             enum: [AvailableMicroservices.Mint]
//         }
//     }
// };
//
// const microserviceCommandImageSchema: JTDSchemaType<MicroserviceCommand<AvailableMicroservices.Image>> = {
//     properties: {
//         command: commandMapSchemaImage,
//         microservice: {
//             enum: [AvailableMicroservices.Image]
//         }
//     }
// };
// const imageCommandsSchema: JTDSchemaType<ImageCommands> = {
//     enum: [ImageCommands.CreateImage, ImageCommands.UpdateToken]
// };
//
// const mintCommandsSchema: JTDSchemaType<MintCommands> = {
//     enum: [MintCommands.MintImage]
// };

// Example discriminator:
// interface Ob extends Record<string, any> {
//     version: string;
//     foo: string | number;
// }
// const ob: Ob[] = [
//     { version: '1', foo: '1' },
//     { version: '2', foo: 1 }
// ];
//
// const validob: JTDSchemaType<Ob> = {
//     discriminator: 'version',
//     mapping: {
//         '1': {
//             properties: {
//                 foo: { type: 'string' }
//             }
//         },
//         '2': {
//             properties: {
//                 foo: { type: 'uint8' }
//             }
//         }
//     }
// };
