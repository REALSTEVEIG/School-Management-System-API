const loader           = require('./_common/fileLoader');
const Validator        = require('../libs/Validator');

/** 
 * load any file that match the pattern of function file and require them 
 * @return an array of the required functions
*/
module.exports = class ValidatorsLoader {
    constructor({models, customValidators}={}){
        this.models = models;
        this.customValidators = customValidators;
    }
    load(){

        const validators = {};

        /**
         * load schemes
         * load models ( passed to the consturctor )
         * load custom validators
         */
        const schemes = loader('./managers/**/*.schema.js');

        Object.keys(schemes).forEach(sk=>{
            let validator = new Validator({models: this.models, customValidators: this.customValidators});
            validators[sk] = {};
            Object.keys(schemes[sk]).forEach(s=>{
                validators[sk][s] =  async (data)=>{
                    return (await validator.validate(data, schemes[sk][s]));
                }
                validators[sk][`${s}Trimmer`] = async (data)=>{
                    return (await validator.trim(data, schemes[sk][s]));
                }
            });
        })

        return validators;
    }
}