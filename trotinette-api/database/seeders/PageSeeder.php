<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        Page::updateOrCreate(
            ['slug' => 'a-propos'],
            [
                'title' => 'A propos de MiraiTech',
                'content' => <<<'HTML'
<p>MiraiTech est une entreprise innovante basee a Casablanca, Maroc, specialisee dans la conception et la distribution de trottinettes electriques premium. Notre mission est de revolutionner la mobilite urbaine en offrant des solutions de transport ecologiques, performantes et elegantes.</p>
<p>Chaque trottinette MiraiTech est concue avec une attention particuliere portee a la qualite, la securite et l'innovation technologique. Nous utilisons des materiaux de haute qualite et integrons les dernieres avancees en matiere de batteries longue portee, de moteurs puissants et de systemes de controle intelligents.</p>
<p>Notre equipe passionnee s'engage a fournir une experience client exceptionnelle, de la selection du produit a la livraison et au service apres-vente. Nous croyons en un avenir ou la mobilite urbaine est a la fois durable, accessible et agreable.</p>
HTML,
            ]
        );

        Page::updateOrCreate(
            ['slug' => 'contact'],
            [
                'title' => 'Contactez-nous',
                'content' => <<<'HTML'
<h2>Adresse</h2>
<p>123 Bd Mohammed V, Casablanca, Maroc</p>
<h2>Telephone</h2>
<p>+212 600 000 000</p>
<h2>E-mail</h2>
<p>contact@miraitech.ma</p>
<h2>WhatsApp</h2>
<p>Cliquez sur le bouton WhatsApp en bas a droite de la page pour nous contacter directement.</p>
HTML,
            ]
        );

        Page::updateOrCreate(
            ['slug' => 'cgv'],
            [
                'title' => 'Conditions Generales de Vente',
                'content' => <<<'HTML'
<h2>1. Objet</h2>
<p>Les presentes conditions generales de vente regissent les ventes de trottinettes electriques effectuees par MiraiTech. Toute commande implique l'acceptation sans reserve des presentes conditions.</p>
<h2>2. Prix</h2>
<p>Les prix sont indiques en dirhams marocains (MAD) toutes taxes comprises. MiraiTech se reserve le droit de modifier ses prix a tout moment, mais les produits seront factures sur la base des tarifs en vigueur au moment de la validation de la commande.</p>
<h2>3. Commande</h2>
<p>Les commandes sont validees apres verification de la disponibilite des produits. Vous recevrez une confirmation par telephone ou e-mail. Le paiement s'effectue a la livraison en especes.</p>
<h2>4. Livraison</h2>
<p>La livraison est effectuee a l'adresse indiquee lors de la commande. Les delais de livraison sont communiques a titre indicatif. En cas de retard, aucune penalite ne pourra etre appliquee.</p>
<h2>5. Retours</h2>
<p>Les retours sont possibles dans un delai de 14 jours a compter de la reception, sous reserve que le produit soit dans son emballage d'origine et en parfait etat. Les frais de retour sont a la charge du client.</p>
<h2>6. Garantie</h2>
<p>Tous nos produits sont garantis contre les defauts de fabrication. La duree de garantie varie selon les modeles et est precisee sur la fiche produit. La garantie ne couvre pas l'usure normale ou les dommages resultant d'une utilisation inappropriee.</p>
HTML,
            ]
        );

        Page::updateOrCreate(
            ['slug' => 'mentions-legales'],
            [
                'title' => 'Mentions Legales',
                'content' => <<<'HTML'
<h2>Editeur du site</h2>
<p>MiraiTech SARL<br>123 Bd Mohammed V, Casablanca, Maroc<br>Registre du commerce: XXXXXXXXX<br>Capital social: XXX XXX MAD<br>E-mail: contact@miraitech.ma</p>
<h2>Hebergeur</h2>
<p>Le site est heberge par [Nom de l'hebergeur]<br>Adresse: [Adresse de l'hebergeur]<br>Telephone: [Telephone de l'hebergeur]</p>
<h2>Propriete intellectuelle</h2>
<p>L'ensemble de ce site releve de la legislation marocaine et internationale sur le droit d'auteur et la propriete intellectuelle. Tous les droits de reproduction sont reserves, y compris pour les documents telechargeables et les representations iconographiques et photographiques.</p>
<h2>Donnees personnelles</h2>
<p>Les informations collectees lors de votre commande sont destinees a MiraiTech pour le traitement de votre commande et la gestion de la relation client. Conformement a la loi, vous disposez d'un droit d'acces, de modification, de rectification et de suppression des donnees vous concernant.</p>
HTML,
            ]
        );
    }
}
