export function compareValidationValues(operator,value1,value2){
        switch (operator) {
          case '=':
           return [value1==value2,'equal to'];
          case '>':
            return [value1>value2,'greater than'];
          case '<':
            return [value1<value2,'less than'];  
          case '>=':
            return [value1>=value2,'greater than or equal to'];
          case '<=':
            return [value1<=value2,'less than or equal to'];
            case '!=':
              return [value1!=value2,'not equal to'];
          default :
          return [false,'[comparison went wrong.]'];
        }
      }