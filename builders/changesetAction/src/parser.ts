export const jsonParser = <T>(str: string) => {
    let parsed = JSON.parse(str) as T;
    if (typeof parsed === 'string') parsed = jsonParser<T>(parsed);
    return parsed;
};
