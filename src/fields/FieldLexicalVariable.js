import * as Blockly from 'blockly/core';

export const SCOPE_GLOBAL = 'global';
export const SCOPE_LOCAL = 'local';
export const TYPE_VAR = 'variable';
export const TYPE_CONST = 'constant';

/**
 * FieldLexicalVariable
 */
export class FieldLexicalVariable extends Blockly.FieldTextInput {
  /**
   * Create a new field lexical variable.
   * @param {string} value initial value of variable.
   * @param {string} scope scope of the variable weather it is 'global' or
   * 'local'.
   * @param {string} type type of the variable weather it is 'variable' or
   * 'constant'.
   * @param {object} config optional configurations of field.
   */
  constructor(value, scope, type, config) {
    super(value, undefined, config);
    this.scope_ = scope || SCOPE_GLOBAL;
    this.type_ = type || TYPE_VAR;
  }

  /**
   * Update the getter and setter block on variable rename.
   */
  updateGetterSetter() {
    this.sourceBlock_.workspace.getAllBlocks().forEach((block) => {
      block.inputList.forEach((input) => {
        input.fieldRow.forEach((field) => {
          if (field.constructor.name === 'FieldLexicalDropdown' &&
          field.getValue() === this.getId()) {
            field.getOptions(false);
            field.setValue(field.getValue());
            block.rendered = false;
            block.render();
          }
        });
      });
    });
  }

  /**
   * Delete the getter and setter on variable delete.
   */
  deleteGetterSetter() {
    this.scopeWorkspace_?.getAllBlocks().forEach((block) => {
      block.inputList.forEach((input) => {
        input.fieldRow.forEach((field) => {
          if (field.constructor.name === 'FieldLexicalDropdown' &&
          field.getValue() === this.getId()) {
            Blockly.Events.setRecordUndo(false);
            block.dispose(true, true);
            Blockly.Events.setRecordUndo(true);
            this.scopeWorkspace_.undoStack_ = this.scopeWorkspace_
                .undoStack_.filter(
                    (e) => {
                      return e.blockId != block.id;
                    }
                );
            this.scopeWorkspace_.redoStack_ = this.scopeWorkspace_
                .redoStack_.filter(
                    (e) => {
                      return e.blockId != block.id;
                    }
                );
          }
        });
      });
    });
  }

  /**
   * Returns the array of used variable names in scope.
   * @return {Array<string>} array of used variable names.
   */
  usedScopeNames() {
    const usedScopeNames = [];
    let usedInGlobal = [];
    const usedInLocal = [];
    const workspace = this.sourceBlock_.workspace;
    workspace.VariableDB = workspace.VariableDB || {};
    usedInGlobal = Object.values(workspace.VariableDB).map((item) => {
      return item.value;
    });
    let block = this.sourceBlock_;
    while (block) {
      const usedInBlock = Object.values(block.VariableDB || {}).map((item) => {
        return item.value;
      });
      usedInLocal.push(...usedInBlock);
      block = block.getSurroundParent();
    }
    usedScopeNames.push(...usedInGlobal);
    usedScopeNames.push(...usedInLocal);
    return usedScopeNames;
  }

  /**
   * Validate the given value.
   * @param {string} value value to check.
   * @return {string | null} value or null if value is invalid.
   */
  validateName(value) {
    try {
      eval(`let ${value} = 1;`);
    } catch {
      return null;
    }
    if (!this.usedScopeNames().includes(value)) {
      return value;
    } else {
      if (value === this.getValue()) {
        return value;
      } else {
        return null;
      }
    }
  }

  /**
   * Get the uniq name for given name.
   * @param {string} name name to be check.
   * @return {string} uniq name or name if name is not uniq.
   */
  getUniqName(name) {
    let newName = name;
    const usedScopeNames = this.usedScopeNames();
    if (usedScopeNames.includes(name)) {
      let i = 1;
      while (usedScopeNames.includes(newName + i)) {
        i++;
      }
      newName += i;
    }
    return newName;
  }

  /**
   * Create or Rename the variable.
   */
  updateVariable() {
    const workspace = this.sourceBlock_.workspace;
    workspace.VariableDB = workspace.VariableDB || {};
    this.sourceBlock_.VariableDB = this.sourceBlock_.VariableDB || {};
    this.setId(this.sourceBlock_.id);
    if (this.getScope() === SCOPE_GLOBAL) {
      if (!workspace.VariableDB[this.getId()]) {
        this.setValue(this.getUniqName(this.getValue()));
      }
      workspace.VariableDB[this.getId()] = this.saveState();
      this.updateGetterSetter();
    } else {
      if (!this.sourceBlock_.VariableDB[this.getId()]) {
        this.setValue(this.getUniqName(this.getValue()));
      }
      this.sourceBlock_.VariableDB[this.getId()] = this.saveState();
      this.updateGetterSetter();
    }
    if (!this.scopeWorkspace_ || !this.scopeBlock_) {
      this.scopeWorkspace_ = workspace;
      this.scopeBlock_ = this.sourceBlock_;
      this.scopeBlock_.setOnChange(function() {
        let i = 0;
        this.usedScopeNames().forEach((item) => {
          if (item === this.getValue()) i++;
        });
        if (i > 1) {
          this.setValue(this.getUniqName(this.getValue()));
        }
      }.bind(this));
    }
    if (!this.getValidator()) {
      this.setValidator(this.validateName);
    }
  }

  /**
   * Render the field.
   */
  render_() {
    if (!this.sourceBlock_.isInFlyout && !this.sourceBlock_.isInMutator) {
      this.updateVariable();
    }
    super.render_();
  }

  /**
   * Delete the field.
   */
  dispose() {
    if (this.getScope() === SCOPE_GLOBAL) {
      this.deleteGetterSetter();
      delete this.scopeWorkspace_?.VariableDB[this.getId()];
    }
    if (this.getScope() === SCOPE_LOCAL) {
      this.deleteGetterSetter();
      delete this.scopeBlock_?.VariableDB[this.getId()];
    }
    super.dispose();
  }

  /**
   * Serialize the XML of field.
   * @param {HTMLElement} element field's parent element.
   * @return {HTMLElement} element with field data.
   */
  toXml(element) {
    element.setAttribute('value', this.getValue());
    element.setAttribute('scope', this.getScope());
    element.setAttribute('type', this.getType());
    element.setAttribute('id', this.getId());
    return element;
  }

  /**
   * Deserialize the XML of field.
   * @param {HTMLElement} element field element.
   */
  fromXml(element) {
    this.setValue(element.getAttribute('value'));
    this.setScope(element.getAttribute('scope'));
    this.setType(element.getAttribute('type'));
    this.setId(element.getAttribute('id'));
  }

  /**
   * Serialize the JSON of the field.
   * @return {object} object with field data.
   */
  saveState() {
    const currentState = {};
    currentState['value'] = this.getValue();
    currentState['scope'] = this.getScope();
    currentState['type'] = this.getType();
    currentState['id'] = this.getId();
    return currentState;
  }

  /**
   * Deserialize the field JSON.
   * @param {object} state object contains field data.
   */
  loadState(state) {
    this.setValue(state['value']);
    this.setScope(state['scope']);
    this.setType(state['type']);
    this.setId(state['id']);
  }

  /**
   * Set the id of variable.
   * @param {string} id id of variable.
   */
  setId(id) {
    if (id) {
      this.id_ = id;
    }
  }

  /**
   * Returns the id of the variable.
   * @return {string} id of the variable.
   */
  getId() {
    return this.id_;
  }

  /**
   * Set the type of the variable.
   * @param {string} type type of the variable.
   */
  setType(type) {
    if (type === TYPE_VAR || type === TYPE_CONST) {
      this.type_ = type;
    }
  }

  /**
   * Get the type of the variable.
   * @return {string} type of the variable.
   */
  getType() {
    return this.type_;
  }

  /**
   * Set the scope of the variable.
   * @param {string} scope new scope of variable.
   */
  setScope(scope) {
    if (scope === SCOPE_GLOBAL || scope === SCOPE_LOCAL) {
      this.scope_ = scope;
    }
  }

  /**
   * Returns the scope of the variable.
   * @return {string} scope of the variable.
   */
  getScope() {
    return this.scope_;
  }
}

Blockly.fieldRegistry.register('field_lexical_variable', FieldLexicalVariable);
