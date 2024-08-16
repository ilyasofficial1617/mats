class State {
    constructor(name) {
        this.name = name;
        this.active = false;
    }

    onEnter() {
        Chat.log(`Entering state: ${this.name}`);
    }

    onExit() {
        Chat.log(`Exiting state: ${this.name}`);
    }
}

class Transition {
    constructor(parent, child) {
        this.parent = parent;
        this.child = child;
    }

    shouldTransition() {
        let should = this.condition();
        Chat.log(`checking ${this.parent.name} to ${this.child.name} : ${should}`)
        return should;
    }
}

class PassTransition extends Transition{
    constructor(parent, child, condition = () => true){
        super(parent, child);
        this.condition = condition;
    }
}

class StateMachine {
    constructor() {
        this.states = [];
        this.transitions = [];
        this.currentState = null;
    }

    addState(state) {
        this.states.push(state);
    }

    addTransition(transition) {
        this.transitions.push(transition);
    }

    setState(stateName) {
        const state = this.states.find(s => s.name === stateName);
        if (state) {
            if (this.currentState) {
                this.currentState.onExit();
            }
            this.currentState = state;
            this.currentState.onEnter();
        }
    }

    update() {
        if (!this.currentState) return;
        for (const transition of this.transitions) {
            if (transition.parent === this.currentState && transition.shouldTransition()) {
                this.setState(transition.child.name);
                break;
            }
        }
    }
}

module.exports = {
    State,
    Transition,
    PassTransition,
    StateMachine
}