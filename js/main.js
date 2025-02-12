Vue.component('Card', {
    template: `
    <div class="card">
        <textarea v-model="card.content" placeholder="Введите заметку"></textarea>
        <button @click="move">Переместить</button>
    </div>
    `,
    props: {
        card: Object,
    },
    methods: {
        move() {
            this.$emit('move', this.card.id);
        },
    },
})

Vue.component('column', {
    template: `
    <div class="column">
        <div v-for="card in cards" :key="card.id">
          <Card :card="card" @move="handleMove(card.id)" />
        </div>
        <button v-if="cards.length < maxCards" @click="addCard">Добавить карточку</button>
    </div>
    `,

    props: {
        cards: Array,
        maxCards: Number,
    },
    methods: {
        addCard() {
            this.$emit('add-card');
        },
        handleMove(cardId) {
            this.$emit('move-card', { cardId, fromColumnIndex: this.$vnode.key, toColumnIndex: null });
        },
    },
})

Vue.component('notepad', {
    template: `
        <div class="notepad">
            <column
                v-for="(column, index) in columns"
                :key="index"
                :cards="column.cards"
                :maxCards="column.maxCards"
                @add-card="addCard(index)"
                @move-card="moveCard"
             />
        </div>
    `,
    data() {
        return {
            columns: [
                { cards: [], maxCards: 3 },
                { cards: [], maxCards: 5 },
                { cards: [], maxCards: Infinity },
            ],
        };
    },
    methods: {
        addCard(columnIndex) {
            const newCard = { id: Date.now(), content: '' };
            this.columns[columnIndex].cards.push(newCard);
        },
        moveCard({ cardId, fromColumnIndex, toColumnIndex }) {
            const card = this.columns[fromColumnIndex].cards.find(c => c.id === cardId);
            if (card) {
                this.columns[fromColumnIndex].cards = this.columns[fromColumnIndex].cards.filter(c => c.id !== cardId);
                this.columns[toColumnIndex].cards.push(card);
            }
        },
    },
})





let app = new Vue({
    el: '#app',

})
