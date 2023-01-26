"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentGenerator = exports.discussionGenerator = exports.teamGenerator = exports.userGenerator = void 0;
var faker_1 = require("@faker-js/faker");
var userGenerator = function (overrides) { return (__assign({ id: faker_1.faker.datatype.uuid(), firstName: faker_1.faker.internet.userName(), lastName: faker_1.faker.internet.userName(), email: faker_1.faker.internet.email(), password: faker_1.faker.internet.password(), teamId: faker_1.faker.datatype.uuid(), teamName: faker_1.faker.company.name(), role: 'ADMIN', bio: faker_1.faker.lorem.sentence(), createdAt: Date.now() }, overrides)); };
exports.userGenerator = userGenerator;
var teamGenerator = function (overrides) { return (__assign({ id: faker_1.faker.datatype.uuid(), name: faker_1.faker.company.name(), description: faker_1.faker.lorem.sentence(), createdAt: Date.now() }, overrides)); };
exports.teamGenerator = teamGenerator;
var discussionGenerator = function (overrides) { return (__assign({ id: faker_1.faker.datatype.uuid(), title: faker_1.faker.company.catchPhrase(), body: faker_1.faker.lorem.sentence(), createdAt: Date.now() }, overrides)); };
exports.discussionGenerator = discussionGenerator;
var commentGenerator = function (overrides) { return (__assign({ id: faker_1.faker.datatype.uuid(), body: faker_1.faker.lorem.sentence(), createdAt: Date.now() }, overrides)); };
exports.commentGenerator = commentGenerator;
