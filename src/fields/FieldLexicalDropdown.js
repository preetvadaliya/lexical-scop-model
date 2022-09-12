/* eslint-disable jsdoc/require-jsdoc */
import * as Blockly from 'blockly/core';

export class FieldLexicalDropdown extends Blockly.FieldDropdown {
  constructor(defaultValue) {
    super(Blockly.Field.SKIP_SETUP);
    this.menuGenerator_ = FieldLexicalDropdown.dropdownGenerator_;
    this.defaultValue_ = defaultValue || ' ';
    this.value_ = this.defaultValue_;
  }

  doClassValidation_ = function(newValue) {
    return newValue;
  }

  render_() {
    super.render_();
    this.sourceBlock_.setOnChange(function() {
      const options = this.menuGenerator_().map((item) => {
        return item[1];
      });
      if (options.includes(this.getValue())) {
        if (this.getValue() === this.defaultValue_) {
          this.sourceBlock_.setWarningText('No Variable Found.');
        } else {
          this.sourceBlock_.setWarningText(null);
        }
      } else {
        this.getOptions(false);
        if (options.length > 0) {
          if (options.includes(this.getValue())) {
            this.setValue(this.getValue());
          } else {
            this.setValue(options[0]);
          }
        } else {
          this.sourceBlock_.setWarningText('No Variable Found.');
        }
      }
    }.bind(this));
  }

  static dropdownGenerator_() {
    const isForSetter = this.sourceBlock_.outputConnection === null;
    const variableDB = this.sourceBlock_.workspace.VariableDB || {};
    let block = this.sourceBlock_;
    const options = [];
    Object.values(variableDB).forEach((item) => {
      if (!isForSetter) {
        options.push([item.value, item.id]);
      } else {
        if (item.type === 'variable') {
          options.push([item.value, item.id]);
        }
      }
    });
    while (block) {
      Object.values(block.VariableDB || {}).forEach((item) => {
        if (!isForSetter) {
          options.push([item.value, item.id]);
        } else {
          if (item.type === 'variable') {
            options.push([item.value, item.id]);
          }
        }
      });
      block = block.getSurroundParent();
    }
    if (options.length === 0) {
      options.push([this.defaultValue_, this.defaultValue_]);
    }
    options.sort(function(item1, item2) {
      if (item1[0] < item2[0]) return -1;
      if (item1[0] >= item2[0]) return 1;
    });
    return options;
  }
}

Blockly.fieldRegistry.register('field_lexical_dropdown', FieldLexicalDropdown);
