import {getFiles} from '../src/filetree'

test('adds 1 + 2 to equal 3', async () => {
    const result = [];
    for await (const file of getFiles('./fixtures/docs', './fixtures/out')) {
        result.push(file)
        //console.log(file.src, '-->', file.out);
    }
    expect(result).toStrictEqual([{
        "out": "/home/parroit/Desktop/parro-it/orgame/fixtures/out/classes/class1.md",
        "src": "/home/parroit/Desktop/parro-it/orgame/fixtures/docs/classes/class1.md",
    }, {
        "out": "/home/parroit/Desktop/parro-it/orgame/fixtures/out/classes/class2.md",
        "src": "/home/parroit/Desktop/parro-it/orgame/fixtures/docs/classes/class2.md",
    }, {
        "out": "/home/parroit/Desktop/parro-it/orgame/fixtures/out/readme.md",
        "src": "/home/parroit/Desktop/parro-it/orgame/fixtures/docs/readme.md",
    }]);
});