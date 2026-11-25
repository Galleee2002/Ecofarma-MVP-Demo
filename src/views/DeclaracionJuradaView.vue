<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function volver() {
    if (window.history.length > 1) {
        router.back();
        return;
    }
    router.push({ name: 'recibir' });
}
</script>

<template>
    <main class="fondo-trama min-h-[calc(100dvh-5rem)]">
        <div class="pagina-media">
            <button type="button" class="w-fit cursor-pointer text-primary" @click="volver">
                Volver
            </button>
            <article class="flex flex-col gap-8 rounded-md bg-surface p-6 shadow-md sm:p-8">
                <header class="flex flex-col gap-2">
                    <h1 class="font-heading text-2xl font-bold text-primary sm:text-3xl">
                        Declaración Jurada de ecofarma
                    </h1>
                    <p class="text-sm text-muted">
                        Documentos V1.0 para receptor y donante. Borrador sujeto a revisión jurídica y sanitaria.
                    </p>
                </header>

                <section class="flex flex-col gap-4">
                    <h2 class="font-heading text-xl font-bold text-foreground">
                        Declaración Jurada del Receptor — V1.0
                    </h2>
                    <p class="text-foreground">
                        Mediante la aceptación de la presente Declaración Jurada, manifiesto que la información
                        proporcionada para solicitar el medicamento es verdadera y que conozco las condiciones aplicables
                        a su recepción mediante ecofarma.
                    </p>

                    <div class="flex flex-col gap-3">
                        <h3 class="font-heading text-lg font-bold text-foreground">1. Destinatario del medicamento</h3>
                        <p class="text-foreground">Al solicitar el medicamento deberé indicar si:</p>
                        <ul class="list-disc space-y-1 pl-5 text-foreground">
                            <li>el medicamento será utilizado por mí; o</li>
                            <li>el medicamento será utilizado por otra persona.</li>
                        </ul>
                        <p class="text-foreground">
                            Cuando solicite el medicamento para un tercero, deberé proporcionar tanto mis datos como
                            solicitante como los datos de la persona que será destinataria y consumirá el medicamento.
                        </p>
                        <p class="text-foreground">Entiendo que:</p>
                        <ul class="list-disc space-y-1 pl-5 text-foreground">
                            <li>ecofarma deberá corroborar la información proporcionada;</li>
                            <li>la operación necesitará habilitación de ecofarma antes de continuar;</li>
                            <li>
                                y el donante será informado de que el medicamento solicitado será destinado a un tercero.
                            </li>
                        </ul>
                        <p class="text-foreground">
                            Declaro que los datos proporcionados sobre mí y, cuando corresponda, sobre el destinatario del
                            medicamento son verdaderos y corresponden a las personas involucradas en la operación.
                        </p>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h3 class="font-heading text-lg font-bold text-foreground">2. Indicación médica o receta</h3>
                        <p class="text-foreground">
                            Si el medicamento se encuentra sujeto a prescripción conforme a la normativa aplicable,
                            declaro que la persona que utilizará el medicamento posee una indicación médica o receta válida
                            correspondiente a dicho medicamento.
                        </p>
                        <p class="text-foreground">
                            Cuando el medicamento sea de venta libre, este requisito no será exigible.
                        </p>
                        <p class="text-foreground">
                            Comprendo que solicitar un medicamento mediante ecofarma no constituye una prescripción,
                            recomendación médica ni indicación de tratamiento por parte de la plataforma.
                        </p>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h3 class="font-heading text-lg font-bold text-foreground">3. Verificación al recibir el medicamento</h3>
                        <p class="text-foreground">
                            Antes de aceptar definitivamente la unidad entregada, me comprometo a comprobar que:
                        </p>
                        <ul class="list-disc space-y-1 pl-5 text-foreground">
                            <li>corresponde al medicamento solicitado;</li>
                            <li>los datos principales coinciden con los registrados en ecofarma;</li>
                            <li>el lote y vencimiento coinciden con los informados;</li>
                            <li>el medicamento no está vencido;</li>
                            <li>conserva una identificación legible;</li>
                            <li>no presenta signos evidentes de adulteración, manipulación o deterioro;</li>
                            <li>
                                y, cuando el envase exterior haya sido abierto, los blísters u otros envases primarios
                                permanecen cerrados e íntegros.
                            </li>
                        </ul>
                        <p class="text-foreground">
                            Si detecto alguna inconsistencia, me comprometo a no aceptar el medicamento y reportar la
                            situación a ecofarma.
                        </p>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h3 class="font-heading text-lg font-bold text-foreground">4. Alcance de la validación de ecofarma</h3>
                        <p class="text-foreground">
                            Reconozco que ecofarma puede verificar la información digital disponible sobre el medicamento
                            y contrastarla con sus fuentes de información.
                        </p>
                        <p class="text-foreground">
                            Comprendo que ecofarma no realiza una inspección física de la unidad que recibiré ni certifica
                            su calidad física, integridad o condiciones reales de conservación.
                        </p>
                        <p class="text-foreground">
                            La inclusión de un medicamento dentro del dataset utilizado por ecofarma determina su
                            elegibilidad inicial dentro de la plataforma, pero la operación permanece sujeta a las
                            restricciones legales, sanitarias y operativas aplicables.
                        </p>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h3 class="font-heading text-lg font-bold text-foreground">5. Entrega</h3>
                        <p class="text-foreground">
                            Comprendo que la entrega física se realiza directamente entre particulares y que ecofarma
                            actúa únicamente como plataforma intermediaria.
                        </p>
                        <p class="text-foreground">
                            ecofarma no recibe, almacena, transporta, manipula ni custodia físicamente el medicamento
                            durante la entrega.
                        </p>
                        <p class="text-foreground">
                            Una vez realizada la entrega deberé confirmar la recepción mediante el mecanismo dispuesto por
                            la plataforma.
                        </p>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h3 class="font-heading text-lg font-bold text-foreground">6. Rechazo y reporte</h3>
                        <p class="text-foreground">
                            Si el medicamento recibido no coincide con lo publicado o presenta alguna irregularidad, podré
                            rechazarlo y reportarlo.
                        </p>
                        <p class="text-foreground">
                            El reporte provocará la interrupción automática de la operación mientras ecofarma analiza el
                            caso.
                        </p>
                        <p class="text-foreground">Una vez resuelta la situación, ecofarma podrá:</p>
                        <ul class="list-disc space-y-1 pl-5 text-foreground">
                            <li>cerrar definitivamente la operación; o</li>
                            <li>habilitar nuevamente el intercambio cuando corresponda.</li>
                        </ul>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h3 class="font-heading text-lg font-bold text-foreground">7. Registro de la declaración y de la operación</h3>
                        <p class="text-foreground">
                            Acepto que ecofarma conserve vinculados a esta operación, como mínimo: usuario donante,
                            usuario receptor, identidad del destinatario cuando sea un tercero, medicamento, lote, fecha
                            de vencimiento, fotografías, fecha y hora, versión de esta Declaración Jurada y confirmación
                            de la entrega.
                        </p>
                        <p class="text-foreground">
                            Declaro que he leído y comprendido la presente Declaración Jurada del Receptor V1.0 y ratifico
                            la veracidad de la información proporcionada.
                        </p>
                    </div>
                </section>

                <section class="flex flex-col gap-4 border-t border-line pt-8">
                    <h2 class="font-heading text-xl font-bold text-foreground">
                        Declaración Jurada del Donante — V1.0
                    </h2>
                    <p class="text-foreground">
                        Mediante la aceptación de la presente Declaración Jurada, manifiesto que la información
                        proporcionada respecto del medicamento ofrecido en donación es verdadera, completa y corresponde a
                        la unidad que será entregada.
                    </p>

                    <div class="flex flex-col gap-3">
                        <h3 class="font-heading text-lg font-bold text-foreground">1. Sobre el medicamento</h3>
                        <p class="text-foreground">Declaro que:</p>
                        <ul class="list-disc space-y-1 pl-5 text-foreground">
                            <li>El medicamento fue obtenido legítimamente y se encuentra legítimamente en mi poder.</li>
                            <li>El medicamento corresponde al producto informado y registrado en ecofarma.</li>
                            <li>
                                Los datos cargados en la plataforma, incluyendo medicamento, presentación, lote y fecha de
                                vencimiento, corresponden exactamente a la unidad que será entregada.
                            </li>
                            <li>
                                Las fotografías cargadas corresponden a la unidad concreta que será entregada, reflejando
                                su estado actual.
                            </li>
                            <li>
                                El medicamento no se encuentra vencido y continuará vigente al momento de realizarse la
                                entrega.
                            </li>
                            <li>
                                El medicamento conserva su envase original, posee identificación legible y no presenta
                                signos de adulteración, manipulación, modificación o deterioro que puedan afectar su
                                identificación o seguridad.
                            </li>
                            <li>
                                En caso de que el envase exterior haya sido abierto, las unidades o envases primarios que
                                contienen el medicamento —por ejemplo, blísters— permanecen cerrados, íntegros y sin signos
                                de manipulación.
                            </li>
                            <li>
                                El medicamento fue conservado respetando las condiciones de almacenamiento indicadas para
                                el producto y, según mi conocimiento, no estuvo expuesto a circunstancias que pudieran
                                alterar sus condiciones.
                            </li>
                        </ul>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h3 class="font-heading text-lg font-bold text-foreground">2. Obligación de informar cambios</h3>
                        <p class="text-foreground">
                            Me comprometo a no entregar el medicamento si, después de su publicación y antes de la
                            entrega:
                        </p>
                        <ul class="list-disc space-y-1 pl-5 text-foreground">
                            <li>vence;</li>
                            <li>pierde su identificación;</li>
                            <li>se abre o manipula su envase primario;</li>
                            <li>sufre daños;</li>
                            <li>se altera su estado;</li>
                            <li>o deja de coincidir con la información o fotografías registradas en ecofarma.</li>
                        </ul>
                        <p class="text-foreground">
                            En cualquiera de estos casos deberé informar la situación a través de la plataforma.
                        </p>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h3 class="font-heading text-lg font-bold text-foreground">3. Solicitudes realizadas para terceros</h3>
                        <p class="text-foreground">
                            Entiendo que un usuario de ecofarma puede solicitar el medicamento para otra persona.
                        </p>
                        <p class="text-foreground">En esos casos:</p>
                        <ul class="list-disc space-y-1 pl-5 text-foreground">
                            <li>ecofarma deberá revisar y habilitar previamente la operación;</li>
                            <li>seré informado de que el medicamento será destinado a un tercero;</li>
                            <li>
                                y no podré rechazar la donación por el solo hecho de que el destinatario final sea una
                                persona distinta del usuario que realizó la solicitud, siempre que ecofarma haya
                                habilitado la operación.
                            </li>
                        </ul>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h3 class="font-heading text-lg font-bold text-foreground">4. Alcance de la validación de ecofarma</h3>
                        <p class="text-foreground">
                            Reconozco que ecofarma puede verificar la información digital disponible sobre el medicamento
                            y contrastarla con sus fuentes de información.
                        </p>
                        <p class="text-foreground">
                            Comprendo que esta validación no constituye una inspección física del medicamento ni una
                            certificación de la calidad, conservación o integridad de la unidad concreta que se encuentra
                            en mi poder.
                        </p>
                        <p class="text-foreground">
                            La responsabilidad de proporcionar información verdadera sobre dicha unidad recae sobre mí
                            como donante.
                        </p>
                        <p class="text-foreground">
                            La inclusión de un medicamento dentro del dataset utilizado por ecofarma determina su
                            elegibilidad inicial dentro de la plataforma, pero su participación permanece sujeta a las
                            restricciones legales, sanitarias y operativas que correspondan. ecofarma podrá impedir,
                            suspender o revisar una operación cuando resulte necesario.
                        </p>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h3 class="font-heading text-lg font-bold text-foreground">5. Entrega</h3>
                        <p class="text-foreground">
                            Comprendo que la entrega física del medicamento se realiza directamente entre particulares.
                        </p>
                        <p class="text-foreground">
                            ecofarma funciona como plataforma intermediaria y no recibe, almacena, transporta, manipula ni
                            custodia físicamente el medicamento durante la entrega.
                        </p>
                        <p class="text-foreground">
                            Me comprometo a entregar exactamente la unidad registrada en la plataforma.
                        </p>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h3 class="font-heading text-lg font-bold text-foreground">6. Rechazo, reporte e inconsistencias</h3>
                        <p class="text-foreground">
                            Comprendo que el receptor podrá rechazar y reportar el medicamento cuando la unidad entregada:
                        </p>
                        <ul class="list-disc space-y-1 pl-5 text-foreground">
                            <li>no coincida con la publicada;</li>
                            <li>presente información inconsistente;</li>
                            <li>se encuentre vencida;</li>
                            <li>presente signos de manipulación o deterioro;</li>
                            <li>o incumpla cualquiera de las condiciones declaradas.</li>
                        </ul>
                        <p class="text-foreground">
                            Ante un reporte de este tipo, la operación será interrumpida automáticamente y ecofarma podrá
                            abrir un caso para analizar la situación.
                        </p>
                        <p class="text-foreground">
                            Una vez resuelto, ecofarma podrá cerrar definitivamente la operación o habilitar nuevamente el
                            intercambio, según corresponda.
                        </p>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h3 class="font-heading text-lg font-bold text-foreground">7. Registro de la declaración</h3>
                        <p class="text-foreground">
                            Acepto que ecofarma conserve vinculados a esta operación, como mínimo: usuario donante,
                            usuario receptor, medicamento, lote, fecha de vencimiento, fotografías, fecha y hora, versión
                            de esta Declaración Jurada y confirmación de la entrega.
                        </p>
                        <p class="text-foreground">
                            Declaro que he leído y comprendido la presente Declaración Jurada del Donante V1.0 y ratifico
                            la veracidad de la información proporcionada.
                        </p>
                    </div>
                </section>

                <p class="border-t border-line pt-4 text-sm text-muted">
                    <RouterLink :to="{ name: 'terminos' }" class="text-primary">
                        Ver Términos y Condiciones
                    </RouterLink>
                </p>
            </article>
        </div>
    </main>
</template>
